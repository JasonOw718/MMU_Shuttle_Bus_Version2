package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.models.DriverModel;
import com.mmu.shuttle.backend.securities.DriverDetail;
import com.mmu.shuttle.backend.models.LoginRequestModel;
import com.mmu.shuttle.backend.securities.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public String login(LoginRequestModel loginRequestModel) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestModel.getEmail(),
                        loginRequestModel.getPassword()
                )
        );

        return jwtService.generateToken(authentication.getName());
    }

    public DriverModel getDriverProfileFromAuth(Authentication authentication) {
        DriverModel driverModel = new DriverModel();

        DriverDetail driverDetail = getDriverDetail(authentication);

        if(driverDetail == null){
            return driverModel;
        }

        driverModel.setId(driverDetail.getId());
        driverModel.setEmail(driverDetail.getEmail());
        return driverModel;
    }

    public Long getDriverIdFromAuth(Authentication authentication) {
        return getDriverDetail(authentication).getDriverId();
    }

    private DriverDetail getDriverDetail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthorizationDeniedException("Missing Valid Credentials");
        }

        if (!(authentication.getPrincipal() instanceof DriverDetail driverDetail)) {
            throw new AuthorizationDeniedException("Invalid Credentials Format");
        }

        return driverDetail;
    }

}
