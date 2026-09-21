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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dealer")
public class DealershipController {

    @Autowired
    private DealershipService dealershipService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DealershipResponse> create(@RequestBody @Valid DealershipRequest dealershipRequest){
        DealershipResponse response = dealershipService.createDealership(dealershipRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<DealershipResponse>> findAll(){
        return ResponseEntity.ok(dealershipService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<DealershipResponse> findById(@PathVariable Long id){
        return ResponseEntity.ok(dealershipService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DealershipResponse> update(@PathVariable Long id, @RequestBody @Valid DealershipRequest dealershipRequest){
        return ResponseEntity.ok(dealershipService.update(id, dealershipRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        dealershipService.delete(id);
        return ResponseEntity.ok().build();
    }
}
