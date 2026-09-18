package com.andre.DesafioStellantis.exceptions;

public class InvalidYearException extends RuntimeException {
    public InvalidYearException(Integer year) {
        super("O ano deve ser superior a 1900. Ano inserido: " + year);
    }
}
