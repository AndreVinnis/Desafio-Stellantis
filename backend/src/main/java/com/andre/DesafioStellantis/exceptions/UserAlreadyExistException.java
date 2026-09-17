package com.andre.DesafioStellantis.exceptions;

public class UserAlreadyExistException extends RuntimeException {
    public UserAlreadyExistException(String email) {
        super("Já existe um usuário com esse email: " + email);
    }
}
