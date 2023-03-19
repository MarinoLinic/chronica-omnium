import plotly.express as px
import plotly.graph_objs as go
import plotly.figure_factory as ff
import matplotlib.pyplot as plt



def timeline_chart(df, rangestart, rangeend, type, title):
    # Filter rows with "Unit" in the "type" column
    df_filtered = df[df["type"] == type]

    # Drop rows where either the start or end year is missing
    df_filtered = df_filtered.dropna(subset=['start', 'end'])

    # Sort rows by start date
    df_sorted = df_filtered.sort_values(by=["start"])

    # Filter rows by range
    df_sortfiltered = df_sorted[(df_sorted["end"] >= rangestart) & (df_sorted["start"] <= rangeend)]

    # Create a horizontal bar chart of the units
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.barh(y=df_sortfiltered["name"], 
            width=df_sortfiltered["end"] - df_sortfiltered["start"], 
            left=df_sortfiltered["start"], 
            height=0.5, 
            align="center",
            color='indianred')
    
    # Set the chart title and axis labels
    ax.set_title("Timeline of {}".format(title), color='white')
    ax.set_xlabel("Date", color='white')
    ax.set_ylabel(title, color='white')
    
    # Invert the y-axis so that the units are listed from top to bottom
    ax.invert_yaxis()
    
    # Show dates in range
    ax.set_xlim(rangestart, rangeend)

    # Set the tick labels to white
    ax.tick_params(colors='white')

    # Set the spines to white
    for spine in ax.spines.values():
        spine.set_edgecolor('white')
    
    # Save the plot to a file
    plt.savefig("Images/{}_({}-{}).png".format(str("timeline" + title), rangestart, rangeend), dpi=400, bbox_inches="tight", transparent=True)



def timeline_chart_plotly(df, rangestart, rangeend, type, title):
    # Filter rows with "Unit" in the "type" column
    df_filtered = df[df["type"] == type]

    # Drop rows where either the start or end year is missing
    df_filtered = df_filtered.dropna(subset=['start', 'end'])

    # Sort rows by start date
    df_sorted = df_filtered.sort_values(by=["start"])

    # Filter rows by range
    df_sortfiltered = df_sorted[(df_sorted["end"] >= rangestart) & (df_sorted["start"] <= rangeend)]

    # Create a horizontal bar chart of the units
    fig = go.Figure()
    fig.add_trace(go.Bar(y=df_sortfiltered["name"],
                         x=df_sortfiltered["end"] - df_sortfiltered["start"],
                         base=df_sortfiltered["start"],
                         orientation='h',
                         marker=dict(color='indianred')))
    
    # Set the chart title and axis labels
    fig.update_layout(title_text="Timeline of {}".format(title),
                      xaxis_title="Date",
                      yaxis_title=title,
                      xaxis=dict(range=[rangestart, rangeend]),
                      yaxis=dict(autorange='reversed'))

    # Set the tick labels to white
    fig.update_xaxes(tickfont=dict(color='white'))
    fig.update_yaxes(tickfont=dict(color='white'))

    # Set the spines to white
    fig.update_layout(plot_bgcolor='black', paper_bgcolor='black')
    fig.update_xaxes(showspikes=True, spikecolor='white', spikemode='across', spikesnap='cursor')
    fig.update_yaxes(showspikes=True, spikecolor='white', spikemode='across', spikesnap='cursor')

    # Save the plot to a file
    fig.write_image("Images/{}_({}-{}).png".format(str("timeline_plotly_" + title), rangestart, rangeend), width=1200, height=800, scale=2, engine='kaleido')



def plot_centuries_histogram(df, filename):
    # Create a new column containing the century of the start date
    df['century'] = (df['start'] // 100) + 1

    # Filter the DataFrame to include only rows between 0 AD and 2000 AD
    df_filtered = df[(df['start'] >= 0) & (df['start'] <= 2000)]

    # Count the occurrences of each century
    century_counts = df_filtered['century'].value_counts()

    # Create a histogram with the century on the x-axis and the counts on the y-axis
    fig = go.Figure(data=[go.Bar(x=century_counts.index, y=century_counts.values)])

    # Update the layout of the figure
    fig.update_layout(
        title='Histogram of Centuries from 0 AD to 2000 AD',
        xaxis_title='Century',
        yaxis_title='Count'
    )

    # fig.show()
    fig.write_image("Images/{}.png".format(filename), scale=10)

