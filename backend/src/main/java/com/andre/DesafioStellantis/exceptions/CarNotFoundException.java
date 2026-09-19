package com.andre.DesafioStellantis.exceptions;

public class CarNotFoundException extends RuntimeException {
    public CarNotFoundException() {
        super("Nenhum carro foi encontrado");
    }
}
