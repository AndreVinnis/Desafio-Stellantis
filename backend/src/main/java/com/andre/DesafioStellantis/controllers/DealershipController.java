package com.andre.DesafioStellantis.controllers;

import com.andre.DesafioStellantis.dto.request.DealershipRequest;
import com.andre.DesafioStellantis.dto.response.AuthResponse;
import com.andre.DesafioStellantis.dto.response.DealershipResponse;
import com.andre.DesafioStellantis.services.DealershipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dealership")
public class DealershipController {

    @Autowired
    private DealershipService dealershipService;

    @PostMapping("/create")
    @PreAuthorize("hasRole(USER)")
    public ResponseEntity<DealershipResponse> create(@RequestBody @Valid DealershipRequest dealershipRequest){
        DealershipResponse response = dealershipService.createDealership(dealershipRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
