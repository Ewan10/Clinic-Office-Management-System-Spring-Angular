package com.ewan.clinic_office_management_system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ewan.clinic_office_management_system.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUserName(String userName);

    boolean existsByUserName(String userName);

    Optional<User> findByEmail(String email);
}
