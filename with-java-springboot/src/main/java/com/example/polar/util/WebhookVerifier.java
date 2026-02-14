package com.example.polar.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class WebhookVerifier {

    private static final String HMAC_SHA256 = "HmacSHA256";

    public static boolean verify(String body, String id, String timestamp, String signature, String secret) {
        if (body == null || id == null || timestamp == null || signature == null || secret == null) {
            return false;
        }

        try {
            // parse signature
            String[] signatures = signature.split(" ");
            String expectedSignature = "";
            for (String s : signatures) {
                if (s.startsWith("v1,")) {
                    expectedSignature = s.substring(3);
                    break;
                }
            }

            if (expectedSignature.isEmpty()) {
                return false;
            }

            // signed payload
            String signedPayload = id + "." + timestamp + "." + body;

            Mac sha256Hmac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            sha256Hmac.init(secretKey);

            byte[] hash = sha256Hmac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
            String actualSignature = Base64.getEncoder().encodeToString(hash);

            return actualSignature.equals(expectedSignature);
        } catch (Exception e) {
            return false;
        }
    }
}
