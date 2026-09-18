package com.andre.DesafioStellantis.repository;

import com.andre.DesafioStellantis.domain.Dealership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DealershipRepository extends JpaRepository<Dealership, Long> {
}
