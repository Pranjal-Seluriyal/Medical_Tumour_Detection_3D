def generate_recommendation(prediction: str, confidence: float, severity: str) -> tuple:
    """
    TODO: Insert your notebook's recommendation mapping rules here.
    Typically:
    - Map low severity to periodic observation.
    - Map moderate/high severity to specialist referrals (radiologist, neurosurgeon).
    - Returns a tuple of (ai_summary, recommendation, next_steps).
    """
    
    if severity == "Low" or "no tumor" in prediction.lower():
        ai_summary = "The uploaded MRI scan was analyzed by the BrainAI system. No anomalous regions or signs of tumor tissue were detected in the cerebral hemispheres. The estimated severity is Low."
        recommendation = "The detected tumor characteristics indicate a lower severity level. Continue consulting your neurologist for further evaluation and periodic monitoring."
        next_steps = "Continue consulting your neurologist for periodic monitoring and routine checkups. Maintain standard diagnostic schedules."
    elif severity == "Moderate":
        ai_summary = "The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is Moderate."
        recommendation = "The AI detected imaging characteristics associated with moderate severity. Please schedule an appointment with a neurologist or neurosurgeon for further evaluation."
        next_steps = "Please consult a neurologist or radiologist for professional evaluation. This AI analysis is intended to support—not replace—a medical diagnosis."
    else: # High
        ai_summary = "The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is High."
        recommendation = "The AI identified imaging characteristics associated with high severity. Prompt consultation with a specialist is strongly recommended."
        next_steps = "Please consult a neurologist or radiologist for professional evaluation immediately. This AI analysis is intended to support—not replace—a medical diagnosis."

    return ai_summary, recommendation, next_steps
