from typing import List
from ..utils.singleton import Singleton
from .status_task import StatusTask

class StatusControl(metaclass=Singleton):
    def __init__(self):
        self._tasks: List[StatusTask] = []

    def create_task(self, total: int) -> int:
        new_task = StatusTask()
        new_task.id = len(self._tasks) + 1 # task id starts from 1
        new_task.total = total
        self._tasks.append(new_task)
        return new_task
    
    def _is_valid_task(self, id: int) -> bool:
        return id <= len(self._tasks) # task id starts from 1

    def get_task(self, id: int) -> StatusTask:
        if not self._is_valid_task(id):
            return None
        return self._tasks[id-1]

    def increment_task(self, id: int) -> None:
          if self._is_valid_task(id):
            self._tasks[id-1].increment()

    def complete_task(self, id: int, data: object=None) -> None:
        if self._is_valid_task(id):
            self._tasks[id-1].data = data
            self._tasks[id-1].complete()