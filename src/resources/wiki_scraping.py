import requests
from bs4 import BeautifulSoup
import re

def wiki(url):
  if not url.startswith("https://en.wikipedia.org"):
        return ""
  
  response = requests.get(url)
  soup = BeautifulSoup(response.content, "html.parser")
  # print(soup.prettify())

  second_h2 = soup.find_all("h2")[1]  # find the second h2 tag

  paragraphs = [] 

  for element in second_h2.find_all_previous():  # loop over all the previous siblings of the second h2 tag
      if element.name == "p":
          paragraphs.append(element) 
      elif element.name == "h2":  # if the element is an <h2> tag
          break  # stop looping if we encounter the second h2 tag

  concatenated_text = ""

  for paragraph in reversed(paragraphs):  # loop over the paragraphs in reverse order
      cleaned_text = re.sub(r"\[.*?\]", "", paragraph.text) # get rid of the references
      if cleaned_text.strip():  # check if the paragraph has any non-whitespace characters
          concatenated_text += cleaned_text + "\n"  # add the cleaned text content to the concatenated string variable with a new line character

  return concatenated_text

