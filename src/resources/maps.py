import requests



def get_location_info(location):
    try:
        response = requests.get(f"https://nominatim.openstreetmap.org/search?q={location}&format=json")
        response.raise_for_status()
        data = response.json()
        if data:
            location_info = {
                "display_name": data[0]["display_name"],
                "boundingbox": data[0]["boundingbox"],
                "osm_id": data[0]["osm_id"],
                "osm_type": data[0]["osm_type"],
                "coordinates": (float(data[0]["lat"]), float(data[0]["lon"]))
            }
            return location_info
        else:
            raise ValueError("No location found")
    except requests.exceptions.HTTPError as error:
        print(f"HTTP error occurred: {error}")
    except requests.exceptions.RequestException as error:
        print(f"An error occurred: {error}")
    except (ValueError, KeyError) as error:
        print(f"Error processing location data: {error}")
