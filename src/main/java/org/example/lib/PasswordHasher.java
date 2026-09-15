package org.example.lib;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

// SHA-256 simple, SOLO para que este ejemplo no guarde contrasenas en texto plano -- no es
// hashing de contrasenas real. En un backend real se usaria bcrypt/argon2 (con salt e
// iteraciones), no un hash criptografico generico de una sola pasada como este.
public final class PasswordHasher {

    private PasswordHasher() {
    }

    public static String hash(String passwordPlano) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(passwordPlano.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
