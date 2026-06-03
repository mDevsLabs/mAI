@routes @extensions @smoke
Feature: Extensions Interactive UI
  As a user
  I want to interact with the extensions page
  So that I can open and close the services sidebar panel

  Background:
    Given the application is running

  @ROUTES-003 @P0
  Scenario: Toggle extensions sidebar panel open and close
    When I navigate to "/extensions"
    Then the page should load without errors
    And I should see the page body
    And the extensions sidebar panel should be open
    When I click the hide sidebar panel button
    Then the extensions sidebar panel should be closed
    When I click the open sidebar panel button
    Then the extensions sidebar panel should be open
