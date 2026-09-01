package com.attendance.backend.controller;

import com.attendance.backend.entity.Leave;
import com.attendance.backend.service.LeaveService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }


    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================
    // Employee + HR
    //
    // POST /api/leaves

    @PostMapping
    public Leave applyForLeave(
            @RequestBody Leave leave,
            Authentication authentication) {

        return leaveService.applyForLeave(
                leave,
                authentication
        );
    }


    // =========================================================
    // GET MY LEAVES
    // =========================================================
    // Employee + HR
    //
    // GET /api/leaves/my

    @GetMapping("/my")
    public List<Leave> getMyLeaves(
            Authentication authentication) {

        return leaveService.getMyLeaves(
                authentication
        );
    }


    // =========================================================
    // GET ALL LEAVES
    // =========================================================
    // HR only
    //
    // GET /api/leaves

    @GetMapping
    public List<Leave> getAllLeaves() {

        return leaveService.getAllLeaves();
    }


    // =========================================================
    // GET PENDING LEAVES
    // =========================================================
    // HR only
    //
    // GET /api/leaves/pending

    @GetMapping("/pending")
    public List<Leave> getPendingLeaves() {

        return leaveService.getPendingLeaves();
    }


    // =========================================================
    // APPROVE LEAVE
    // =========================================================
    // HR only
    //
    // PUT /api/leaves/{id}/approve

    @PutMapping("/{id}/approve")
    public Leave approveLeave(
            @PathVariable Long id) {

        return leaveService.approveLeave(id);
    }


    // =========================================================
    // REJECT LEAVE
    // =========================================================
    // HR only
    //
    // PUT /api/leaves/{id}/reject

    @PutMapping("/{id}/reject")
    public Leave rejectLeave(
            @PathVariable Long id) {

        return leaveService.rejectLeave(id);
    }
}