# -*- coding: utf-8 -*-

# Copyright (C) 2013  Alex Yatskov
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


import os.path
from .translate import Translator
from .deinflect import Deinflector
from .dictionary import Dictionary
from .pitch import Pitch

directory = os.path.dirname(__file__)

class Japanese():
    def __init__(self):
        self.translator = Translator(
            Deinflector(os.path.join(directory, 'deinflect.json')),
            Dictionary(os.path.join(directory, 'dictionary.db')))
        self.pitch = Pitch(os.path.join(directory, 'pitch_accents.sqlite'))