package com.andre.DesafioStellantis.exceptions;

import java.math.BigDecimal;

public class InvalidPriceException extends RuntimeException {
    public InvalidPriceException(BigDecimal price) {
        super("O valor do veículo deve superior a 0. Valor inserido: " + price);
    }
}
