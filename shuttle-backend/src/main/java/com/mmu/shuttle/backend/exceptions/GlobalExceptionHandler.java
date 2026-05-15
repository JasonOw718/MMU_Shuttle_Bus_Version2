package com.mmu.shuttle.backend.exceptions;

import com.mmu.shuttle.backend.models.ExceptionModel;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionModel> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(FileException.class)
    public ResponseEntity<ExceptionModel> handleFileException(FileException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "File Exception",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ExceptionModel> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ExceptionModel> handleAuthorizationDeniedException(AuthorizationDeniedException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Permission Denied",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ExceptionModel> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Access Denied",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ExceptionModel> handleConstraintViolation(ConstraintViolationException ex,
            HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        String message = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                message,
                request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ExceptionModel> handleDuplicateResourceException(DuplicateResourceException ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Duplicate Resource Exception",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionModel> handleException(Exception ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        ExceptionModel error = new ExceptionModel(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Internal Server Error",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

}
