import json
import pandas as pd
import re
from wiki_scraping import wiki



def add_wiki(df):
    for i, row in df.iterrows():
        source = row["source"]
        if pd.notna(source) and source.strip():
            wiki_text = wiki(source)
            df.at[i, "wiki"] = wiki_text
    return df



def alg_geo(data, start, end, i, list, df):
  for j in range(len(data)):
      data_range = data[j] if list else data.iloc[j]

      if data_range['start'] <= start and data_range['end'] >= start:
          data_name = data_range['name']
          data_type = data_range['type']
          df.at[i, str("geologic_" + data_type.lower())] = data_name

          if data_range['sub'] != []:
              # recursion: the items in levels below are lists, not pandas.core.frame.DataFrame   
              alg_geo(data_range['sub'], start, end, i, True, df)


def alg_general(data, start, end, i, list, df, algtype):
  for j in range(len(data)):
      data_range = data[j] if list else data.iloc[j]

      if data_range['start'] <= start and data_range['end'] >= start:
          if data_range['sub'] != []:
              alg_general(data_range['sub'], start, end, i, True, df, algtype)
          else:
              data_name = data_range['name']
              df.at[i, algtype] = data_name


def time_scales(df):
  # Create new columns in your existing DataFrame
  df['geologic_epoch'] = ''
  df['geologic_eon'] = ''
  df['geologic_era'] = ''
  df['geologic_period'] = ''
  df['climatic'] = ''
  df['archeological'] = ''
  df['anthropologic'] = ''

  # Load the JSON file
  with open('time_scales.json', 'r') as f:
      time_scales_json = json.load(f)

  # Extract the geologic timescale data
  geologic_timescale = time_scales_json['time_scale']['geologic']
  climatic_timescale = time_scales_json['time_scale']['climatic']
  archeological_timescale = time_scales_json['time_scale']['archeological']
  anthropologic_timescale = time_scales_json['time_scale']['anthropologic']

  # Convert the data to a DataFrame
  geologic_df = pd.read_json(json.dumps(geologic_timescale))
  climatic_df = pd.read_json(json.dumps(climatic_timescale))
  archeological_df = pd.read_json(json.dumps(archeological_timescale))
  anthropologic_df = pd.read_json(json.dumps(anthropologic_timescale))

  
  for i, row in df.iterrows():
    start = row['start']
    end = row['end']

    alg_geo(geologic_df, start, end, i, False, df)
    alg_general(archeological_df, start, end, i, False, df, "archeological")
    alg_general(anthropologic_df, start, end, i, False, df, "anthropologic")

  return df



def add_id(df):
    # adding numbers instead 
    id_values = list(range(1, len(df)+1))
    df['id_num'] = id_values

    # Modify the "name" column to generate the "id" column
    df['id'] = df['name'].apply(lambda x: re.sub(r'[^a-z0-9\-]+', '', str(x).lower().replace(' ', '-')))

    # Add the new column to the DataFrame
    df = df[['id', 'name'] + list(df.columns.difference(['id', 'name']))]

    return df



def convert_to_json(df):
    # Convert the dataframe to a JSON object with formatting
    json_obj = df.to_json(orient='records', indent=4)

    # Replace the escaped forward slashes with regular forward slashes in the JSON string
    json_obj = json_obj.replace('\\/', '/')

    with open('World_History.json', 'w') as f:
        f.write(json_obj)
    f.close()