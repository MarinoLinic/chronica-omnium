import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from functions import plot_centuries_histogram, timeline_chart

# Define the name of the input CSV file
input_file = 'World_History.csv'

# Read the CSV file into a pandas dataframe, while handling encoding errors
try:
    df = pd.read_csv(input_file, delimiter=';', encoding='utf-8')
except UnicodeDecodeError:
    df = pd.read_csv(input_file, delimiter=';', encoding='iso-8859-1')

# Print the first five rows of the dataframe
# print(df.head())

# Convert the dataframe to a JSON object with formatting
json_obj = df.to_json(orient='records', indent=4)

# Replace the escaped forward slashes with regular forward slashes in the JSON string
json_obj = json_obj.replace('\\/', '/')

# Write the resulting JSON object to a file
with open('World_History.json', 'w') as f:
    f.write(json_obj)
f.close()

# Call the function to create the histogram and save it as an image
plot_centuries_histogram(df, 'histogram')

# Create a timeline of empires, nations, and kingdoms in a given time window
timeline_chart(df, 0, 2000)