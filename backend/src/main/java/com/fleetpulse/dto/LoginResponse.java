package com.fleetpulse.dto;

public record LoginResponse(
    String token,
    String type,
    String name,
    String role
) {}