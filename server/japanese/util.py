import unicodedata


# Credit to ianki
# Kana utils
hiragana = "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ" \
            "あいうえおかきくけこさしすせそたちつてと" \
            "なにぬねのはひふへほまみむめもやゆよらりるれろ" \
            "わをんぁぃぅぇぉゃゅょっゐゑ"
katakana = "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ" \
            "アイウエオカキクケコサシスセソタチツテト" \
            "ナニヌネノハヒフヘホマミムメモヤユヨラリルレロ" \
            "ワヲンァィゥェォャュョッヰヱ"

katakana_ord = [ord(char) for char in katakana]
hiragana_ord = [ord(char) for char in hiragana]
translate_table_h = dict(zip(katakana_ord, hiragana))
translate_table_k = dict(zip(hiragana_ord, katakana))

def kaner(to_translate, hiraganer = False):
    if hiraganer:
        return to_translate.translate(translate_table_h)
    else:
        return to_translate.translate(translate_table_k) 

def is_kanji(ch):
    try:
        return 'CJK UNIFIED IDEOGRAPH' in unicodedata.name(ch)
    except:
        return False


def is_kanji(ch):
  try:
      return 'CJK UNIFIED IDEOGRAPH' in unicodedata.name(ch)
  except:
      return False


def is_hiragana(ch):
  return 'HIRAGANA' in unicodedata.name(ch)


def split_okurigana(text, kana):
  ret = ['','']

  for t in text:
    if is_hiragana(t):
      # hiragana
      while len(kana):
        k = kana[0]
        kana = kana[1:]
        if t == k:
          if ret[0]:
            yield ret
          yield (t,'')
          ret = ['','']
          break
        else:
          ret[1] += k
    else:
      # kanji
      ret[0] += t
      if len(kana):
        ret[1] += kana[0]
        kana = kana[1:]
  # save any trailing kana
  ret[1] += kana
  if ret[0]:
    yield ret


def morph_to_ruby_html(surface, reading):
    if not any(is_kanji(_) for _ in surface):
        return surface

    ret = ''
    for pair in split_okurigana(surface, reading):
        if pair[1]:
            kanji,hira = pair
            ret += f"<ruby><rb>{kanji}</rb><rt>{hira}</rt></ruby>"
        else:
            ret += pair[0]
    return ret
