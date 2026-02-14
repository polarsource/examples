package com.example.polar.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

@Service
public class PolarService {

        private final RestClient restClient;
        private final String serverUrl;

        public PolarService(Dotenv dotenv) {
                String accessToken = dotenv.get("POLAR_ACCESS_TOKEN");
                String mode = dotenv.get("POLAR_MODE", "production");

                System.out.println("PolarService initialized with Mode: " + mode);
                if (accessToken == null || accessToken.isEmpty()) {
                        System.err.println("CRITICAL: POLAR_ACCESS_TOKEN is missing!");
                } else {
                        System.out.println("POLAR_ACCESS_TOKEN found (starts with: "
                                        + accessToken.substring(0, Math.min(10, accessToken.length())) + "...)");
                }

                this.serverUrl = mode.equals("sandbox")
                                ? "https://sandbox-api.polar.sh"
                                : "https://api.polar.sh";

                this.restClient = RestClient.builder()
                                .baseUrl(this.serverUrl)
                                .defaultHeader("Authorization", "Bearer " + accessToken)
                                .defaultHeader("Content-Type", "application/json")
                                .build();
        }

        public JsonNode listProducts() {
                try {
                        return restClient.get()
                                        .uri("/v1/products/?is_archived=false")
                                        .retrieve()
                                        .body(JsonNode.class);
                } catch (Exception e) {
                        System.err.println("Error in listProducts: " + e.getMessage());
                        return null;
                }
        }

        public JsonNode createCheckout(String productId, String successUrl) {
                try {
                        return restClient.post()
                                        .uri("/v1/checkouts/")
                                        .body(Map.of(
                                                        "products", new String[] { productId },
                                                        "success_url", successUrl))
                                        .retrieve()
                                        .body(JsonNode.class);
                } catch (Exception e) {
                        System.err.println("Error in createCheckout: " + e.getMessage());
                        return null;
                }
        }

        public JsonNode findCustomerByEmail(String email) {
                try {
                        return restClient.get()
                                        .uri(uriBuilder -> uriBuilder
                                                        .path("/v1/customers/")
                                                        .queryParam("email", email)
                                                        .build())
                                        .retrieve()
                                        .body(JsonNode.class);
                } catch (Exception e) {
                        System.err.println("Error in findCustomerByEmail: " + e.getMessage());
                        return null;
                }
        }

        public JsonNode createCustomerSession(String customerId) {
                try {
                        return restClient.post()
                                        .uri("/v1/customer-sessions/")
                                        .body(Map.of("customer_id", customerId))
                                        .retrieve()
                                        .body(JsonNode.class);
                } catch (Exception e) {
                        System.err.println("Error in createCustomerSession: " + e.getMessage());
                        return null;
                }
        }
}
