package edu.upenn.cis.nets2120.news;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;  
import java.io.IOException;
import java.io.Reader;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Iterator;

import org.json.*;

import org.apache.hadoop.yarn.webapp.hamlet.HamletSpec._;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.parser.SqlBaseParser.TableNameContext;

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
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.codegurureviewer.model.transform.CommitDiffSourceCodeTypeJsonUnmarshaller;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import scala.Tuple2;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.SparkConnector;
import edu.upenn.cis.nets2120.storage.DynamoConnector;

public class ComputeRanks {	
	
	/**
	 * The basic logger
	 */
	// static Logger logger = LogManager.getLogger(ComputeRanks.class);

	/**
	 * Connection to DynamoDB
	 */
	DynamoDB db;

	/**
	 * Connection to Apache Spark
	 */
	SparkSession spark;
	
	JavaSparkContext context;

	/**
	 * Params
	 */
	public double D_MAX;
	public int I_MAX;
	public boolean DEBUG;
	
	public static double DECAY = 0.15;
	
	public ComputeRanks() {
		System.setProperty("file.encoding", "UTF-8");
		
		this.D_MAX = 30;
		this.I_MAX = 15;
		this.DEBUG = false;
	}

	/**
	 * Initialize the database connection and open the file
	 * 
	 * @throws IOException
	 * @throws InterruptedException 
	 */
	public void initialize() throws IOException, InterruptedException {
		System.out.println("Connecting to Spark...");

		System.out.println("Initializing...");
		// spark = SparkConnector.getSparkConnection();
		context = SparkConnector.getSparkContext();
		
		System.out.println("Connected!");
	}

	// public void exportDynamoDB() throws IOException {
	// 	List<String> features = new ArrayList<String>();
	// 	features.add("news_id", "category");
	// 	ScanResult r = db.scan("news", features);
	// 	System.out.println(r.getScannedCount());
	// }
	
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
	
	// private JavaRDD<Integer> getSinks(JavaPairRDD<Integer,Integer> network) {
	// 	// Get the number of unique nodes and edges
	// 	JavaRDD<Integer> outgoing = network.map(x -> x._1);
	// 	JavaRDD<Integer> ingoing = network.map(x -> x._2);
		
	// 	int numNodes = (int) outgoing.union(ingoing).distinct().count();
	// 	int numEdges = (int) network.count();
		
	// 	logger.info(String.format("This graph contains %d nodes and %d edges", numNodes, numEdges));
		
	// 	// Sinks are nodes with ingoing edges that have no outgoing edges
	// 	JavaRDD<Integer> sinks = ingoing.subtract(outgoing).distinct();
		
	// 	return sinks;
	// }
	
	/**
	 * Helper method to get a PairRDD containing the initial ranks for each node
	 * 
	 * @param network
	 * @return socialRanks
	 */
	// private JavaPairRDD<Integer, Double> getInitSocialRanks(JavaPairRDD<Integer,Integer> network) {
	// 	// Get the number of unique nodes and edges
	// 	JavaRDD<Integer> outgoing = network.map(x -> x._1);
	// 	JavaRDD<Integer> ingoing = network.map(x -> x._2);
		
	// 	return outgoing.union(ingoing).distinct().mapToPair(node -> new Tuple2<Integer, Double>(node, 1.0));
	// }


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
	 * @throws InterruptedException User presses Ctrl-C
	 */
	public void run() throws IOException, InterruptedException {
		System.out.println("Connecting to DynamoDB...");
        db = DynamoConnector.getConnection(Config.DYNAMODB_URL);
        System.out.println("Connected!");

		// Load the DynamoDB tables as undirected graphs into local files
		getTableEntries(db, "news", "news_id, category");
		getTableEntries(db, "friends", "sender, receiver");
		getTableEntries(db, "users", "username, interests");

		// Load the news graph
		JavaPairRDD<String, String> network = getNewsGraph();
    	
		// Get edge weights

		// When computing ranks, we do the same process as before, but we only want to transfer labels if
		// they're above a certain threshold

		// therefore, we should remove all labels from the RDD that don't meet that requirement before
		// running adsorption as usual
	}

	public static void main( String[] args )
    {  
		System.out.println("Running!");

        ComputeRanks cr = new ComputeRanks();

        try {
			cr.initialize();
            cr.run();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}