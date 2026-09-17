package com.andre.DesafioStellantis.controllers;

import com.andre.DesafioStellantis.auth.JwtService;
import com.andre.DesafioStellantis.domain.User;
import com.andre.DesafioStellantis.dto.AuthResponse;
import com.andre.DesafioStellantis.dto.UserCreateRequest;
import com.andre.DesafioStellantis.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/create")
    public ResponseEntity<AuthResponse> create(@RequestBody @Valid UserCreateRequest newUser){
        User user = userService.createUser(newUser);
        var token = jwtService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token));
    }
}
