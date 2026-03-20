package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.UserSettingsUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.UserSettingsResponse;
import com.example.financeTracker.Entity.User;

import java.util.UUID;

public interface UserSettingsService {

    void createDefaultSettingsForUser(User user);

    UserSettingsResponse getSettingsByUserId(UUID userId);

    UserSettingsResponse updateSettings(UUID userId, UserSettingsUpdateRequest request);

    boolean isSettingEnabled(UUID userId, String settingKey);
}
