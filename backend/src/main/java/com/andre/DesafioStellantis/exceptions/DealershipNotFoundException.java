package com.andre.DesafioStellantis.exceptions;

public class DealershipNotFoundException extends RuntimeException {
    public DealershipNotFoundException() {
        super("Nenhuma concessionária foi encontrada");
    }
}
