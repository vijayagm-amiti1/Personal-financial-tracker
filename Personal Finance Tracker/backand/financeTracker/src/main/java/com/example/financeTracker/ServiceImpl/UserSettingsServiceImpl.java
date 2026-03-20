package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.UserSettingsUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.UserSettingsResponse;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Entity.UserSettings;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Repository.UserSettingsRepository;
import com.example.financeTracker.Service.UserSettingsService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void createDefaultSettingsForUser(User user) {
        userSettingsRepository.findByUserId(user.getId()).ifPresentOrElse(existing -> {
        }, () -> userSettingsRepository.save(UserSettings.builder()
                .user(user)
                .settingsJson(buildSettingsJson(defaultSettingsMap()))
                .build()));
    }

    @Override
    public UserSettingsResponse getSettingsByUserId(UUID userId) {
        User user = getUser(userId);
        UserSettings userSettings = getOrCreateUserSettings(user);
        return mapToResponse(user, readSettingsMap(userSettings.getSettingsJson()));
    }

    @Override
    @Transactional
    public UserSettingsResponse updateSettings(UUID userId, UserSettingsUpdateRequest request) {
        User user = getUser(userId);
        user.setDisplayName(request.displayName().trim());

        UserSettings userSettings = getOrCreateUserSettings(user);
        Map<String, Boolean> settings = new LinkedHashMap<>();
        settings.put("allowSendEmailNotification", request.allowSendEmailNotification());
        settings.put("allowBudgetThresholdAlert", request.allowBudgetThresholdAlert());
        settings.put("allowBudgetExceededAlert", request.allowBudgetExceededAlert());
        settings.put("allowGoalNotification", request.allowGoalNotification());
        settings.put("allowGoalCompletionBeforeTargetDateNotification", request.allowGoalCompletionBeforeTargetDateNotification());
        settings.put("allowGoalMissedTargetDateNotification", request.allowGoalMissedTargetDateNotification());
        settings.put("allowMonthlyBudgetReport", request.allowMonthlyBudgetReport());
        settings.put("navbarVerticalEnabled", request.navbarVerticalEnabled());

        userSettings.setSettingsJson(buildSettingsJson(settings));
        userSettings.setUpdatedAt(LocalDateTime.now());
        userSettingsRepository.save(userSettings);
        userRepository.save(user);

        log.info("Updated user settings for user {}", userId);
        return mapToResponse(user, settings);
    }

    @Override
    public boolean isSettingEnabled(UUID userId, String settingKey) {
        User user = getUser(userId);
        UserSettings userSettings = getOrCreateUserSettings(user);
        Map<String, Boolean> settings = readSettingsMap(userSettings.getSettingsJson());
        return settings.getOrDefault(settingKey, false);
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserSettings getOrCreateUserSettings(User user) {
        return userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> userSettingsRepository.save(UserSettings.builder()
                        .user(user)
                        .settingsJson(buildSettingsJson(defaultSettingsMap()))
                        .build()));
    }

    private UserSettingsResponse mapToResponse(User user, Map<String, Boolean> settings) {
        return new UserSettingsResponse(
                user.getEmail(),
                user.getDisplayName(),
                settings.getOrDefault("allowSendEmailNotification", false),
                settings.getOrDefault("allowBudgetThresholdAlert", false),
                settings.getOrDefault("allowBudgetExceededAlert", false),
                settings.getOrDefault("allowGoalNotification", false),
                settings.getOrDefault("allowGoalCompletionBeforeTargetDateNotification", false),
                settings.getOrDefault("allowGoalMissedTargetDateNotification", false),
                settings.getOrDefault("allowMonthlyBudgetReport", false),
                settings.getOrDefault("navbarVerticalEnabled", false)
        );
    }

    private Map<String, Boolean> defaultSettingsMap() {
        Map<String, Boolean> defaults = new LinkedHashMap<>();
        defaults.put("allowSendEmailNotification", false);
        defaults.put("allowBudgetThresholdAlert", false);
        defaults.put("allowBudgetExceededAlert", false);
        defaults.put("allowGoalNotification", false);
        defaults.put("allowGoalCompletionBeforeTargetDateNotification", false);
        defaults.put("allowGoalMissedTargetDateNotification", false);
        defaults.put("allowMonthlyBudgetReport", false);
        defaults.put("navbarVerticalEnabled", false);
        return defaults;
    }

    private Map<String, Boolean> readSettingsMap(String settingsJson) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Boolean> parsed = objectMapper.readValue(settingsJson, Map.class);
            return new LinkedHashMap<>(defaultSettingsMap()) {{
                putAll(parsed);
            }};
        } catch (JsonProcessingException exception) {
            log.warn("Failed to parse user settings JSON, falling back to defaults", exception);
            return defaultSettingsMap();
        }
    }

    private String buildSettingsJson(Map<String, Boolean> settings) {
        try {
            return objectMapper.writeValueAsString(settings);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize user settings", exception);
        }
    }
}
