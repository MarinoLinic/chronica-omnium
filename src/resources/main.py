import json
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from plotting import plot_centuries_histogram, timeline_chart
from data_manipulation import convert_to_json, time_scales

# Define the name of the input CSV file
input_file = 'World_History.csv'

# Read the CSV file into a pandas dataframe, while handling encoding errors
try:
    df = pd.read_csv(input_file, delimiter=';', encoding='iso-8859-1')
except UnicodeDecodeError:
    df = pd.read_csv(input_file, delimiter=';', encoding='utf-8')

# print(df.head())

### Functions
# Add stuff
df = time_scales(df)

# Convert to JSON
convert_to_json(df)

# Call the function to create the histogram and save it as an image
plot_centuries_histogram(df, 'histogram')

# Create a timeline of empires, nations, and kingdoms in a given time window
timeline_chart(df, 0, 2000)
timeline_chart(df, -4000, 0)