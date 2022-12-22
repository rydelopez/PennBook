package edu.upenn.cis.nets2120.config;

/**
 * Global configuration for NETS 2120 homeworks.
 * 
 * A better version of this would read a config file from the resources,
 * such as a YAML file.  But our first version is designed to be simple
 * and minimal. 
 * 
 * @author zives
 *
 */
public class Config {

	public static String DYNAMODB_URL = "https://dynamodb.us-east-1.amazonaws.com";
	
	public static String LOCAL_SPARK = "local[*]";

	/**
	 * How many RDD partitions to use?
	 */
	public static int PARTITIONS = 5;
}
