package com.andre.DesafioStellantis.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Corpo padrão de todas as respostas de erro da API.
 * "fields" só aparece em erros de validação (campo -> mensagem).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fields
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponse withFields(int status, String error, String message, String path,
                                           Map<String, String> fields) {
        return new ErrorResponse(Instant.now(), status, error, message, path, fields);
    }
}
