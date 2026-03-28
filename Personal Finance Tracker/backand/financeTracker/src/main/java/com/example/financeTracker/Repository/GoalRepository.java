package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Goal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findAllByUserId(UUID userId);

    Optional<Goal> findByIdAndUserId(UUID id, UUID userId);

    Optional<Goal> findByUserIdAndNameIgnoreCase(UUID userId, String name);

    List<Goal> findAllByUserIdAndLinkedAccountId(UUID userId, UUID linkedAccountId);

    @Query("""
            select distinct g
            from Goal g
            left join AccountMember am on am.account = g.linkedAccount
            where g.linkedAccount.isActive = true
              and (g.linkedAccount.user.id = :userId or am.user.id = :userId)
            order by g.targetDate asc nulls last, g.name asc
            """)
    List<Goal> findAllAccessibleByUserId(@Param("userId") UUID userId);

    @Query("""
            select distinct g
            from Goal g
            left join AccountMember am on am.account = g.linkedAccount
            where g.id = :goalId
              and g.linkedAccount.isActive = true
              and (g.linkedAccount.user.id = :userId or am.user.id = :userId)
            """)
    Optional<Goal> findAccessibleByIdAndUserId(@Param("goalId") UUID goalId, @Param("userId") UUID userId);
}
