package com.mmu.shuttle.backend.controllers;

import com.mmu.shuttle.backend.models.DriverModel;
import com.mmu.shuttle.backend.models.LoginRequestModel;
import com.mmu.shuttle.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/driver/login")
    public String login(@RequestBody LoginRequestModel loginRequestModel) {
        return authService.login(loginRequestModel);
    }
    @GetMapping("/driver/profile")
    public ResponseEntity<DriverModel> getProfile(Authentication authentication) {
        return new ResponseEntity<>(authService.getDriverProfileFromAuth(authentication), HttpStatus.OK);
    }
}