package com.andre.DesafioStellantis.controllers;

import com.andre.DesafioStellantis.auth.JwtService;
import com.andre.DesafioStellantis.domain.User;
import com.andre.DesafioStellantis.dto.AuthRequest;
import com.andre.DesafioStellantis.dto.AuthResponse;
import com.andre.DesafioStellantis.dto.UserCreateRequest;
import com.andre.DesafioStellantis.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> create(@RequestBody @Valid UserCreateRequest newUser){
        User user = userService.createUser(newUser);
        var token = jwtService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest authRequest){
        var usernamePassword = new UsernamePasswordAuthenticationToken(authRequest.email(), authRequest.password());
        var auth = authenticationManager.authenticate(usernamePassword);
        var token = jwtService.generateToken((User) Objects.requireNonNull(auth.getPrincipal()));
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
