import json
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from plotting import plot_centuries_histogram, timeline_chart, timeline_chart_plotly
from data_manipulation import convert_to_json, time_scales, add_id, add_wiki

# Define the name of the input CSV file
input_file = 'World_History.csv'

# Read the CSV file into a pandas dataframe, while handling encoding errors
try:
    df = pd.read_csv(input_file, delimiter=';', encoding='iso-8859-1')
except UnicodeDecodeError:
    df = pd.read_csv(input_file, delimiter=';', encoding='utf-8')

# print(df.head())

### Functions
# Add and remove columns in the dataframe
df = time_scales(df)
df = add_id(df)
df = add_wiki(df)

# Convert to JSON
convert_to_json(df)

# Call the function to create the histogram and save it as an image
# plot_centuries_histogram(df, 'histogram')

# Create a timeline of empires, nations, and kingdoms in a given time window
# timeline_chart(df, 0, 2000, "Unit", "Units")
# timeline_chart(df, -4000, 0, "Unit", "Units")
# timeline_chart(df, 1700, 1900, "Unit", "Units")
# timeline_chart(df, 1750, 1850, "Person", "People")
# timeline_chart_plotly(df, 1750, 1850, "Person", "People")