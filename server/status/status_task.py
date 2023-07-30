from enum import Enum

class ProgressTypes(Enum):
    PROGRESS = 'progress'
    COMPLETED = 'complete'

class StatusTask():
    def __init__(self):
        self.status = ProgressTypes.PROGRESS
        self.sender = None # id for sender
        self.data = None # final result body
        self._counter = 0
        self.total = 0
        self.id = None # id for identifying task

    def reset(self):
        self.status = ProgressTypes.PROGRESS
        self.sender = None
        self.total = 0

    def increment(self):
        self._counter += 1

    def get_status(self):
        return self.status.value

    def get_progress_percentage(self):
        if self.total == 0:
            return 100 # 100%
        if self._counter == 0:
            return 0 # 0%
        return round(self._counter / self.total * 100, 2)
    
    def complete(self):
        self.status = ProgressTypes.COMPLETED