package com.andre.DesafioStellantis.exceptions;

public class InvalidCepException extends RuntimeException {
    public InvalidCepException(String cep) {
        super("CEP inválido: " + cep);
    }
}
