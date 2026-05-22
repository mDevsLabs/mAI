# Dostosowywanie Agentów ⚙️

Dostrojenie agentów w **mAI** pozwala na głęboką modyfikację ich zachowania, stylu odpowiedzi oraz narzędzi, do których mają dostęp.

## Ustawienia Podstawowe

Dla każdego agenta możesz skonfigurować:
- **Prompt Systemowy**: Fundamentalne instrukcje określające osobowość, zasady i rolę agenta. Jest to ustawienie mające największy wpływ na odpowiedzi agenta.
- **Model Językowy**: Wybierz domyślny LLM do użycia (np. GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Ustawienia Zaawansowane

Możesz również modyfikować hiperparametry generowania:
- **Temperatura (Temperature)**: Kontroluje kreatywność odpowiedzi. Niższa temperatura (np. 0.2) daje bardziej rzeczowe i deterministyczne odpowiedzi. Wyższa temperatura (np. 0.9) sprzyja kreatywności.
- **Top P**: Inna metoda kontrolowania różnorodności odpowiedzi.
- **Kara za obecność / częstotliwość (Presence / Frequency Penalty)**: Zachęca lub zniechęca agenta do powtarzania tych samych słów lub odbiegania od omawianych tematów.
- **Maksymalna liczba tokenów (Max Tokens)**: Ogranicza maksymalną długość wygenerowanej odpowiedzi.
