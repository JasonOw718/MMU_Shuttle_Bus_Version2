package com.mmu.shuttle.backend.securities;

import com.mmu.shuttle.backend.entities.Driver;
import com.mmu.shuttle.backend.repositories.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Driver driver = driverRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        DriverDetail driverDetail = new DriverDetail();
        driverDetail.setId(driver.getId());
        driverDetail.setEmail(driver.getEmail());
        driverDetail.setPassword(driver.getPassword());
        return driverDetail;
    }
}
