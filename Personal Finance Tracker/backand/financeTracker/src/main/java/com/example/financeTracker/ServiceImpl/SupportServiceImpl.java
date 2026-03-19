package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.IssueReportRequest;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AuthMailService;
import com.example.financeTracker.Service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final UserRepository userRepository;
    private final AuthMailService authMailService;

    @Override
    public void reportIssue(String currentUserEmail, IssueReportRequest request) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found."));

        authMailService.sendIssueReportEmail(
                user.getEmail(),
                user.getDisplayName(),
                request.subject(),
                request.page(),
                request.message()
        );
    }
}
