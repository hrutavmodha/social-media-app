import os
import random
counter = 0
while counter < 10:
    agent_id = random.randint(1, 11)
    os.system(f'gemini -p "Read TASKS.md. Find the first unticked and non-WIP task. Your AgentID is {agent_id}. If you see the pre-existing WIP with the ID same as yours, then don\'t proceed, inform the user and stop. Else, inform the user about your ID, mark the feature as [WIP AgentID] instead of [], where AgentID is the unique ID provided to you, implement the unticked feature, test it, push the implemented feature, mark implemented feature as completed in the TASKS.md file and stop" --yolo')
    counter += 1