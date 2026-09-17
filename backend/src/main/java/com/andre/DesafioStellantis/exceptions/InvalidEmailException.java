package com.andre.DesafioStellantis.exceptions;

public class InvalidEmailException extends RuntimeException {
    public InvalidEmailException(String email) {
        super("Email inválido: " + email);
    }
}
