package edu.upenn.cis.nets2120.news.livy;

import java.io.IOException;
import java.io.Serializable;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;  
import java.io.Reader;
import java.util.Comparator;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Iterator;

import org.json.*;

import org.apache.livy.Job;
import org.apache.livy.JobContext;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.TableWriteItems;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ResourceInUseException;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;
import com.amazonaws.services.codegurureviewer.model.transform.CommitDiffSourceCodeTypeJsonUnmarshaller;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;
import scala.Tuple2;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.DynamoConnector;
import edu.upenn.cis.nets2120.storage.SparkConnector;


public class NewsRankJob implements Job<List<MyPair<Integer,Double>>> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Connection to DynamoDB
	 */
	DynamoDB db;

	/**
	 * Connection to Apache Spark
	 */
	SparkSession spark;
	
	JavaSparkContext context;

	private boolean useBacklinks;

	private String source;
	
	private final double D_MAX = 30;
	private final int I_MAX = 25;
	

	/**
	 * Initialize the database connection and open the file
	 * 
	 * @throws IOException
	 * @throws InterruptedException 
	 * @throws DynamoDbException 
	 */
	public void initialize() throws IOException, InterruptedException {
		System.out.println("Connecting to Spark...");
		spark = SparkConnector.getSparkConnection();
		context = SparkConnector.getSparkContext();
		
		System.out.println("Connected!");
	}

	/**
	 * getNewsGraph
	 * 
	 * @param filePath
	 * @return JavaPairRDD: (followed: int, follower: int)
	 * @throws IOException 
	 */
	JavaPairRDD<String, String> getNewsGraph() throws IOException {

		// Article <-> category
		JavaRDD<String[]> file = context.textFile("table_results_news", Config.PARTITIONS
			.map(line -> line.toString().split("[ \t]")));

		// Read into RDD with lines as strings
		// JavaRDD<String[]> file = context.textFile(filePath, Config.PARTITIONS)
		// 		.map(line -> line.toString().split("[ \t]"));
		
		// Create a network PairRDD from the RDD of lines
		JavaPairRDD<String, String> network = file.mapToPair(line -> new Tuple2<String, String>(
				new JSONObject(line).getJSONObject("news_id").toString(), 
				new JSONObject(line).getJSONObject("category").toString()));
		
		// Remove duplicate connections		
		// network = network.distinct();
		
		return network;
	}

	public void getTableEntries(DynamoDB db, String tableName, String projection) throws FileNotFoundException, IOException {
		File file = new File("table_results_" + tableName + ".txt");
		FileWriter fileWriter = new FileWriter(file, false);
		PrintWriter writer = new PrintWriter(fileWriter);

		Table table = db.getTable(tableName);

		ItemCollection<ScanOutcome> items = table.scan( 
			// FilterExpression 
			null,                                  			
			// ProjectionExpression
			projection,
			// No ExpressionAttributeNames       								
			null,                                           
			null);
			
		System.out.println("Scanned table"); 
		Iterator<Item> iterator = items.iterator(); 
		
		while (iterator.hasNext()) { 
			Item item = iterator.next();
			// String[] results = Arrays.stream(attrs).map(
			// 	attr -> attr.split("\\|")[1].equals("set") 
			// 	? item.getStringSet(attr.split("\\|")[0])
			// 	: item.getString(attr.split("\\|")[0]).toString())
			// 	.toArray(String[]::new);
			
			// String line = String.join(" ", results);
			writer.println(item.toJSON());
		}

		writer.close();
	}

	/**
	 * Main functionality in the program: read and process the social network
	 * 
	 * @throws IOException File read, network, and other errors
	 * @throws DynamoDbException DynamoDB is unhappy with something
	 * @throws InterruptedException User presses Ctrl-C
	 */
	public void run() throws IOException, InterruptedException {
		System.out.println("Running");

		System.out.println("Connecting to DynamoDB...");
        db = DynamoConnector.getConnection(Config.DYNAMODB_URL);
        System.out.println("Connected!");

		// Load the DynamoDB tables as undirected graphs into local files
		getTableEntries(db, "news", "news_id, category");
		getTableEntries(db, "friends", "sender, receiver");
		getTableEntries(db, "users", "username, interests");

		// Load the news graph
		JavaPairRDD<String, String> network = getNewsGraph();
		
		// return results;
	}

	public NewsRankJob() {
		System.setProperty("file.encoding", "UTF-8");
		
		// this.useBacklinks = useBacklinks;
		// this.source = source;
	}

	@Override
	public List<MyPair<Integer, Double>> call(JobContext arg0) throws Exception {
		initialize();
		run();

		System.out.println("Finished running");

		return new ArrayList<>();
	}

}
