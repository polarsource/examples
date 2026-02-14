package com.example.polar.controller;

import com.example.polar.service.PolarService;
import com.example.polar.util.WebhookVerifier;
import com.fasterxml.jackson.databind.JsonNode;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.web.servlet.view.RedirectView;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class PolarController {

    private final PolarService polarService;
    private final String webhookSecret;
    private final String successUrl;

    public PolarController(PolarService polarService, Dotenv dotenv) {
        this.polarService = polarService;
        this.webhookSecret = dotenv.get("POLAR_WEBHOOK_SECRET");
        this.successUrl = dotenv.get("POLAR_SUCCESS_URL");
    }

    @GetMapping("/")
    @ResponseBody
    public String home() {
        try {
            JsonNode products = polarService.listProducts();
            StringBuilder html = new StringBuilder();
            html.append("<html><body>")
                    .append("<form action=\"/portal\" method=\"get\">")
                    .append("<input type=\"email\" name=\"email\" placeholder=\"Email\" required />")
                    .append("<button type=\"submit\">Open Customer Portal</button>")
                    .append("</form>");

            if (products != null) {
                JsonNode items = products.get("items");
                if (items != null && items.isArray()) {
                    for (JsonNode item : items) {
                        String id = item.get("id").asText();
                        String name = item.get("name").asText();
                        html.append("<div><a target=\"_blank\" href=\"/checkout?products=")
                                .append(id).append("\">").append(name).append("</a></div>");
                    }
                }
            }

            html.append("</body></html>");
            return html.toString();
        } catch (Exception e) {
            return "<html><body>Error: " + e.getMessage() + "</body></html>";
        }
    }

    @GetMapping("/checkout")
    public Object checkout(@RequestParam(name = "products") String products, HttpServletRequest request) {
        try {
            String productId = products;
            String host = request.getHeader("host");
            String effectiveSuccessUrl = (successUrl != null && !successUrl.isEmpty())
                    ? successUrl
                    : "http://" + host + "/";

            JsonNode checkout = polarService.createCheckout(productId, effectiveSuccessUrl);
            if (checkout == null || !checkout.has("url")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to create checkout session");
            }
            return new RedirectView(checkout.get("url").asText());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/portal")
    public Object portal(@RequestParam String email) {
        try {
            JsonNode customers = polarService.findCustomerByEmail(email);
            if (customers == null || !customers.has("items")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found or API error");
            }

            JsonNode items = customers.get("items");
            if (items == null || !items.isArray() || items.size() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            String customerId = items.get(0).get("id").asText();
            JsonNode session = polarService.createCustomerSession(customerId);
            if (session == null || !session.has("customer_portal_url")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to create customer session");
            }
            return new RedirectView(session.get("customer_portal_url").asText());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/polar/webhooks")
    @ResponseBody
    public ResponseEntity<String> webhooks(@RequestBody String body, HttpServletRequest request) {
        String id = request.getHeader("webhook-id");
        String timestamp = request.getHeader("webhook-timestamp");
        String signature = request.getHeader("webhook-signature");

        boolean isValid = WebhookVerifier.verify(body, id, timestamp, signature, webhookSecret);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid signature");
        }

        System.out.println("Received webhook: " + body);
        return ResponseEntity.ok(body);
    }
}
