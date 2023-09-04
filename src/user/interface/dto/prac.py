from __future__ import annotations
#Subscript for class "list" will generate runtime exception; enclose type annotation in quotes 방지용

import collections

def group_anagrams(self, strs:list[str]) -> list[list[str]]:
    anagrams = collections.defaultdict(list)

    for word in strs:
        anagrams[''.join(sorted(word))].append(word)
    return anagrams.values()