package com.andre.DesafioStellantis.exceptions;

public class InvalidFuelTypesException extends RuntimeException {
    public InvalidFuelTypesException() {
        super("Nenhum tipo de combustível informado");
    }
}
