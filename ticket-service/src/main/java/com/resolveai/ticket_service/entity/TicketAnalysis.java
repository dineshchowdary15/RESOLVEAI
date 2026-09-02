package com.resolveai.ticketservice.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ticket_analyses")
public class TicketAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(
            name = "predicted_priority",
            nullable = false,
            length = 30
    )
    private String predictedPriority;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String summary;

    @Column(
            name = "possible_causes",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String possibleCauses;

    @Column(
            name = "recommended_actions",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String recommendedActions;
    @Column(
            name = "knowledge_sources",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String knowledgeSources;
    @Column(nullable = false)
    private double confidence;

    @Column(
            name = "created_at",
            nullable = false
    )
    private OffsetDateTime createdAt;

    public TicketAnalysis() {
    }

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getKnowledgeSources() {
    return knowledgeSources;
    }
    public void setKnowledgeSources(String knowledgeSources) {
        this.knowledgeSources = knowledgeSources;
    }
    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPredictedPriority() {
        return predictedPriority;
    }

    public void setPredictedPriority(
            String predictedPriority
    ) {
        this.predictedPriority = predictedPriority;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getPossibleCauses() {
        return possibleCauses;
    }

    public void setPossibleCauses(
            String possibleCauses
    ) {
        this.possibleCauses = possibleCauses;
    }

    public String getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(
            String recommendedActions
    ) {
        this.recommendedActions =
                recommendedActions;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            OffsetDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }
}