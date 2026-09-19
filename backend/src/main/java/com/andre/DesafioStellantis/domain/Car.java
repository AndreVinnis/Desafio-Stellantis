package com.andre.DesafioStellantis.domain;

import com.andre.DesafioStellantis.enums.FuelType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String mark;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, length = 100)
    private String chassis;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private BigDecimal price;

    @ElementCollection(targetClass = FuelType.class)
    @CollectionTable(name = "car_fuel_types", joinColumns = @JoinColumn(name = "car_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private List<FuelType> fuelsTypes = new ArrayList<>();

    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false, length = 50)
    private String externalColor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "dealership_id", nullable = false)
    private Dealership dealership;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
