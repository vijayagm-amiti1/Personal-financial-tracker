package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    User saveUser(User user);

    Optional<User> getUserById(UUID id);

    Optional<User> getUserByEmail(String email);

    List<User> getAllUsers();

    void deleteUser(UUID id);
}
