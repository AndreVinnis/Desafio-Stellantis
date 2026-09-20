package com.andre.DesafioStellantis.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("Usuário com id " + id + " não foi encontrado");
    }
}
