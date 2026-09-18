package com.andre.DesafioStellantis.repository;

import com.andre.DesafioStellantis.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
