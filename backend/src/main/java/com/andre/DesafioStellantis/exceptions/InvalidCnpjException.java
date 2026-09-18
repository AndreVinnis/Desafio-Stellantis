package com.andre.DesafioStellantis.exceptions;

public class InvalidCnpjException extends RuntimeException {
    public InvalidCnpjException(String cnpj) {
        super("CNPJ inválido: " + cnpj);
    }
}
