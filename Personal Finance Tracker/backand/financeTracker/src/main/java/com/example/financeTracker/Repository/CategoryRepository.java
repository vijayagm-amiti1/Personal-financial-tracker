package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Category;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findAllByUserId(UUID userId);

    List<Category> findAllByUserIdAndIsArchivedFalse(UUID userId);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);
}
