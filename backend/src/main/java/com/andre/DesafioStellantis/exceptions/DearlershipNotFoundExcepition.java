package com.andre.DesafioStellantis.exceptions;

public class DearlershipNotFoundExcepition extends RuntimeException {
    public DearlershipNotFoundExcepition() {
        super("Nenhuma concessionária foi encontrada");
    }
}
